# Optimistic UI 설계하기

Optimistic UI는 서버 응답을 기다리지 않고 사용자의 행동이 성공할 것이라고 가정해 화면을 먼저 바꾸는 패턴입니다.

좋아요, 체크, 북마크처럼 실패 가능성이 낮고 되돌리기 쉬운 행동에 잘 맞습니다. 반대로 결제, 계정 삭제, 권한 변경처럼 실패 비용이 큰 행동에는 신중해야 합니다.

## 기본 흐름

```txt
사용자 행동
-> 화면을 즉시 성공처럼 변경
-> 서버 요청
-> 성공하면 확정
-> 실패하면 되돌리고 오류 표시
```

## 수동 optimistic update

```tsx
async function handleLikeClick(postId: number) {
  setLikedIds((ids) => [...ids, postId]);

  try {
    await likePost(postId);
  } catch {
    setLikedIds((ids) => ids.filter((id) => id !== postId));
    showToast("좋아요 저장에 실패했습니다.");
  }
}
```

이 코드는 간단하지만 중복 클릭, 요청 순서, 실패 복구를 직접 관리해야 합니다.

## useOptimistic

React의 `useOptimistic`은 pending action 동안 임시 optimistic state를 보여주는 Hook입니다.

```tsx
function LikeButton({
  liked,
  saveLike,
}: {
  liked: boolean;
  saveLike: () => Promise<boolean>;
}) {
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(liked);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      setOptimisticLiked(true);
      await saveLike();
    });
  }

  return (
    <button disabled={isPending} onClick={handleClick}>
      {optimisticLiked ? "좋아요 취소" : "좋아요"}
    </button>
  );
}
```

`useOptimistic`은 optimistic state가 실제 source of truth를 영구히 대체하는 것이 아니라, action이 pending인 동안 보여줄 임시 값을 만든다는 관점으로 봐야 합니다.

action이 완료되면 `useOptimistic`은 자동으로 `liked` (실제 값)로 돌아갑니다.

## 목록 추가 optimistic update

댓글 작성처럼 임시 item을 먼저 보여줄 수도 있습니다.

```tsx
type CommentAction = {
  type: "comment/added";
  comment: Comment;
};

function optimisticReducer(comments: Comment[], action: CommentAction) {
  switch (action.type) {
    case "comment/added":
      return [action.comment, ...comments];
  }
}

const [optimisticComments, addOptimisticComment] = useOptimistic(
  comments,
  optimisticReducer,
);
```

임시 item에는 서버 id가 없을 수 있으므로 temporary id와 pending 상태를 명확히 둡니다.

```tsx
const temporaryComment = {
  id: `temp-${Date.now()}`,
  body,
  status: "pending" as const,
};
```

서버 응답이 오면 실제 데이터로 교체하거나, 서버 state를 다시 불러와 정합성을 맞춥니다.

## 목록 삭제 optimistic update (완성 예시)

아이템을 즉시 목록에서 제거하되, 실패하면 되돌리는 패턴입니다.

```tsx
type Item = { id: string; title: string };

function ItemList({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState(initialItems);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  async function handleDelete(id: string) {
    // 즉시 목록에서 숨김 (optimistic)
    setItems((prev) => prev.filter((item) => item.id !== id));
    setDeletingIds((prev) => new Set([...prev, id]));

    try {
      await deleteItem(id);
    } catch {
      // 실패하면 원래 아이템 복구
      setItems((prev) => {
        const original = initialItems.find((item) => item.id === id);
        if (!original) return prev;
        return [...prev, original].sort(/* 원래 순서 복원 */);
      });
      showToast("삭제에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          {item.title}
          <button
            onClick={() => handleDelete(item.id)}
            disabled={deletingIds.has(item.id)}
          >
            {deletingIds.has(item.id) ? "삭제 중..." : "삭제"}
          </button>
        </li>
      ))}
    </ul>
  );
}
```

## TanStack Query의 optimistic update

React Query를 쓴다면 `useMutation`의 `onMutate` / `onError` / `onSettled` 콜백으로 optimistic update를 처리합니다.

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

function useLikePost(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => likePost(postId),

    onMutate: async () => {
      // 진행 중인 refetch 취소
      await queryClient.cancelQueries({ queryKey: ["post", postId] });

      // 현재 cache snapshot 저장 (롤백용)
      const previousPost = queryClient.getQueryData(["post", postId]);

      // Optimistic update
      queryClient.setQueryData(["post", postId], (old: Post) => ({
        ...old,
        liked: true,
        likeCount: old.likeCount + 1,
      }));

      return { previousPost };
    },

    onError: (_error, _variables, context) => {
      // 실패하면 snapshot으로 되돌리기
      if (context?.previousPost) {
        queryClient.setQueryData(["post", postId], context.previousPost);
      }
    },

    onSettled: () => {
      // 성공/실패 모두 최신 데이터로 갱신
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });
}
```

## 실패 복구 설계

Optimistic UI에서 가장 중요한 부분은 실패했을 때입니다.

- 화면을 이전 상태로 되돌릴 것인가?
- 실패한 item을 남겨 두고 "재시도"를 보여줄 것인가?
- toast만 보여주면 충분한가?
- 여러 optimistic update가 겹쳤을 때 어떤 순서로 복구할 것인가?

삭제처럼 되돌리기 어려운 행동은 즉시 사라지게 하기보다 pending 표시 후 확정하는 방식도 고려합니다.

```tsx
<button disabled={isDeleting}>
  {isDeleting ? "삭제 중..." : "삭제"}
</button>
```

## 언제 optimistic UI를 피할까

- 실패 가능성이 높다.
- 실패했을 때 사용자 손실이 크다.
- 서버 검증 결과에 따라 UI가 크게 달라진다.
- 여러 사용자가 동시에 수정해 충돌 가능성이 크다.
- 되돌리기 로직이 실제 성공 로직보다 복잡하다.

| 행동 | optimistic update 적합성 | 이유 |
| --- | --- | --- |
| 좋아요 / 북마크 | 높음 | 실패해도 재시도 쉬움 |
| 댓글 작성 | 중간 | 임시 ID 관리 필요 |
| 프로필 수정 | 중간 | 검증 실패 가능 |
| 결제 | 낮음 | 실패 비용이 큼 |
| 계정 삭제 | 낮음 | 되돌리기 어려움 |

## 읽으면서 생각할 질문

- 이 행동은 실패해도 쉽게 되돌릴 수 있는가?
- optimistic 상태와 실제 서버 상태의 source of truth를 구분하고 있는가?
- 실패했을 때 사용자에게 어떤 복구 행동을 줄 것인가?
- 임시 id와 서버 id를 구분하고 있는가?
- optimistic update가 제품 신뢰도를 해칠 위험은 없는가?
- 여러 개의 optimistic update가 동시에 진행될 때 각각 독립적으로 복구할 수 있는가?
