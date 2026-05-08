# Router 감각 잡기

Router는 URL을 기준으로 어떤 화면을 보여줄지 정하는 도구입니다.

처음에는 라이브러리 사용법보다 "URL도 하나의 상태"라는 감각을 잡는 것이 중요합니다. 사용자가 특정 URL로 들어왔을 때 같은 화면을 볼 수 있어야 합니다.

라우팅이 생기면 화면을 page 단위로 나누게 됩니다. 이때 page 안에서만 필요한 state와 여러 page에서 공유되는 state를 구분해야 합니다.

## URL은 공유 가능한 state다

React state는 새로고침하면 사라집니다. 반면 URL은 복사해서 공유할 수 있고, 새로고침해도 남고, 브라우저의 뒤로 가기/앞으로 가기와 연결됩니다.

그래서 아래 값들은 URL에 두는 것을 고려합니다.

- 현재 페이지 번호
- 검색어
- 정렬 기준
- 필터
- 선택된 탭
- 상세 페이지의 id

반대로 아래 값들은 보통 URL에 두지 않습니다.

- 모달 안의 임시 입력값
- 드롭다운이 열려 있는지 여부
- hover 상태
- 서버에 저장되지 않은 form draft
- 한 컴포넌트 안에서만 쓰는 작은 토글

## path params와 search params

URL 상태는 크게 path params와 search params로 나눠 생각할 수 있습니다.

```txt
/posts/42?tab=comments&page=2
```

| 부분 | 의미 | 예 |
| --- | --- | --- |
| path params | 어떤 자원을 보는지 | `/posts/42` |
| search params | 같은 화면 안의 옵션 | `?tab=comments&page=2` |

게시글 42번 상세 화면처럼 화면의 대상이 바뀌면 path params가 자연스럽습니다. 댓글 탭, 페이지 번호, 정렬 기준처럼 같은 화면 안에서 보는 방식이 바뀌면 search params가 자연스럽습니다.

## page 컴포넌트와 일반 컴포넌트

라우팅이 생기면 컴포넌트 책임을 더 명확히 나눌 수 있습니다.

| 구분 | 책임 |
| --- | --- |
| page 컴포넌트 | URL 읽기, 데이터 요청 연결, 화면 큰 구조 구성 |
| 일반 컴포넌트 | props를 받아 UI 표시, 작은 interaction 처리 |

예를 들어 `PostListPage`는 URL에서 `keyword`와 `page`를 읽고 데이터를 요청합니다. `PostList`는 posts를 받아 목록만 그립니다.

```tsx
function PostListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") ?? "";

  const { state, refetch } = usePosts({ keyword });

  return (
    <PostListScreen
      keyword={keyword}
      requestState={state}
      onKeywordChange={(nextKeyword) => {
        setSearchParams({ keyword: nextKeyword });
      }}
      onRetry={refetch}
    />
  );
}
```

`PostListScreen`은 router 라이브러리를 몰라도 됩니다.

```tsx
function PostListScreen(props: Props) {
  return (
    <>
      <SearchInput value={props.keyword} onChange={props.onKeywordChange} />
      <RequestStateView state={props.requestState} onRetry={props.onRetry} />
    </>
  );
}
```

이 구조는 테스트와 재사용에도 유리합니다. URL을 다루는 코드와 화면을 그리는 코드가 분리되기 때문입니다.

## URL과 local state를 중복 저장하지 않기

URL에 있는 값을 다시 state로 복사하면 동기화 문제가 생기기 쉽습니다.

```tsx
const [searchParams] = useSearchParams();
const [keyword, setKeyword] = useState(searchParams.get("keyword") ?? "");
```

이렇게 하면 URL이 바뀌었는데 `keyword` state는 그대로 남을 수 있습니다. URL이 source of truth라면 URL에서 바로 읽거나, 입력 중 임시값이 필요한 경우에만 local state를 둡니다.

```tsx
const keyword = searchParams.get("keyword") ?? "";
```

입력 중에는 local state를 쓰고 submit할 때 URL에 반영하는 방식도 가능합니다.

```tsx
function SearchForm({ initialKeyword, onSubmit }: Props) {
  const [draft, setDraft] = useState(initialKeyword);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(draft);
      }}
    >
      <input value={draft} onChange={(event) => setDraft(event.target.value)} />
      <button type="submit">검색</button>
    </form>
  );
}
```

이때 `draft`는 입력 중 임시값이고, URL의 `keyword`는 검색이 확정된 값입니다. 두 값의 역할이 다르므로 중복 state가 아닙니다.

## 라우팅과 state reset

React는 같은 위치에 같은 컴포넌트가 있으면 state를 보존합니다. URL만 바뀌었는데 같은 컴포넌트가 계속 렌더링되면 내부 state가 남을 수 있습니다.

상세 페이지에서 id가 바뀔 때 내부 form state를 초기화해야 한다면 `key`를 사용할 수 있습니다.

```tsx
function PostEditRoute() {
  const { postId } = useParams();

  return <PostEditForm key={postId} postId={postId} />;
}
```

`key`가 바뀌면 React는 이전 컴포넌트 state를 보존하지 않고 새로 만듭니다.

## 뒤로 가기까지 설계하기

URL을 바꾸는 방식도 사용자 경험에 영향을 줍니다.

- 검색 submit, 페이지 이동처럼 사용자의 명확한 이동은 history에 남기는 편이 자연스럽습니다.
- 입력하는 매 글자마다 URL을 바꾸는 경우는 history가 너무 많이 쌓일 수 있습니다.
- 탭 변경은 제품 성격에 따라 history에 남길지 결정합니다.

라우터 라이브러리를 쓰더라도 이 판단은 개발자가 해야 합니다. "뒤로 가기 버튼을 눌렀을 때 사용자가 기대하는 화면이 무엇인가"를 기준으로 봅니다.

## 읽으면서 생각할 질문

- 이 화면 상태는 URL에 남아야 하는가?
- 새로고침해도 유지되어야 하는 정보인가?
- page 컴포넌트와 일반 컴포넌트의 책임은 어떻게 다른가?
- 라우팅을 추가하면 state 위치가 바뀌는가?
- 뒤로 가기와 앞으로 가기를 눌렀을 때 자연스러운가?
- URL에 있는 값을 local state로 다시 복사하고 있지는 않은가?
- path params와 search params 중 어느 쪽이 더 의미에 맞는가?
