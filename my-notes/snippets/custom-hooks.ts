/**
 * 自定义 Hooks 集合
 * 从项目中提取的可复用 Hooks
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// ============================================
// 1. useCounter - 计数器 Hook
// ============================================

interface UseCounterReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  setCount: (value: number) => void;
}

export function useCounter(
  initialValue: number = 0,
  step: number = 1
): UseCounterReturn {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount((prev) => prev + step);
  }, [step]);

  const decrement = useCallback(() => {
    setCount((prev) => prev - step);
  }, [step]);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  return { count, increment, decrement, reset, setCount };
}

// 使用示例：
// const { count, increment, decrement, reset } = useCounter(0, 2);

// ============================================
// 2. useLocalStorage - 本地存储 Hook
// ============================================

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  // 从 localStorage 读取初始值
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 更新 localStorage
  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

// 使用示例：
// const [name, setName] = useLocalStorage<string>('name', 'Guest');

// ============================================
// 3. useToggle - 布尔值切换 Hook
// ============================================

export function useToggle(
  initialValue: boolean = false
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  return [value, toggle, setValue];
}

// 使用示例：
// const [isOpen, toggleOpen, setIsOpen] = useToggle(false);

// ============================================
// 4. useDebounce - 防抖 Hook
// ============================================

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 使用示例：
// const debouncedSearchTerm = useDebounce(searchTerm, 500);

// ============================================
// 5. usePrevious - 获取上一次的值
// ============================================

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// 使用示例：
// const previousCount = usePrevious(count);

// ============================================
// 6. useAsync - 异步数据获取 Hook
// ============================================

interface UseAsyncReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: () => Promise<void>;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
): UseAsyncReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFunction();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { data, loading, error, execute };
}

// 使用示例：
// const { data, loading, error } = useAsync(() => fetchUserData(userId));

// ============================================
// 7. useOnClickOutside - 点击外部检测 Hook
// ============================================

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;
      if (!el || el.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// 使用示例：
// const ref = useRef<HTMLDivElement>(null);
// useOnClickOutside(ref, () => setIsOpen(false));

// ============================================
// 8. useMediaQuery - 媒体查询 Hook
// ============================================

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    
    const listener = () => setMatches(media.matches);
    
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// 使用示例：
// const isMobile = useMediaQuery('(max-width: 768px)');

// ============================================
// 9. useInterval - 定时器 Hook
// ============================================

export function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(() => savedCallback.current(), delay);

    return () => clearInterval(id);
  }, [delay]);
}

// 使用示例：
// useInterval(() => setCount(c => c + 1), 1000);

// ============================================
// 10. useCopyToClipboard - 复制到剪贴板 Hook
// ============================================

export function useCopyToClipboard(): [
  string | null,
  (text: string) => Promise<void>
] {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copy = async (text: string) => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
    } catch (error) {
      console.error('Failed to copy:', error);
      setCopiedText(null);
    }
  };

  return [copiedText, copy];
}

// 使用示例：
// const [copiedText, copy] = useCopyToClipboard();
// <button onClick={() => copy('Hello World')}>Copy</button>

