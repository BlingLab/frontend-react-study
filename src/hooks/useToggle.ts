import { useState } from "react";

export function useToggle(initialValue = false) {
  const [isOn, setIsOn] = useState(initialValue);

  return {
    isOn,
    turnOn: () => setIsOn(true),
    turnOff: () => setIsOn(false),
    toggle: () => setIsOn((value) => !value),
  };
}
