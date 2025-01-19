import { act, renderHook } from "@/test/utils";
import { useLocalStorage } from "./useLocalStorage";

describe("useLocalStorage", () => {
  it("should return the default value if no value is stored", () => {
    const { result } = renderHook(() => useLocalStorage<{ a: number }>("test", { a: 1 }));
    const [value] = result.current;
    expect(value).toEqual({ a: 1 });
  });

  it("should return the stored value if one is stored", () => {
    localStorage.setItem("test", JSON.stringify({ a: 2 }));
    const { result } = renderHook(() => useLocalStorage<{ a: number }>("test", { a: 1 }));
    const [value] = result.current;
    expect(value).toEqual({ a: 2 });
  });

  it("should update the stored value when set is called", () => {
    const { result } = renderHook(() => useLocalStorage<{ a: number }>("test", { a: 1 }));
    const [, setValue] = result.current;
    act(() => { setValue({ a: 3 }); });
    const [value] = result.current;
    expect(value).toEqual({ a: 3 });
    expect(JSON.parse(localStorage.getItem("test")!)).toEqual({ a: 3 });
  });
});
