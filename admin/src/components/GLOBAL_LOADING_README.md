# Global Loading Component

一个符合 2025 年设计审美的全局 loading 组件，带有毛玻璃效果和流畅动画。

## 特性

- 🎨 现代化设计 - 毛玻璃背景 + 流畅动画
- 🎯 全局可用 - 通过 Context 提供的全局状态管理
- 💬 可选消息 - 支持显示加载提示文字
- 🌈 主题适配 - 遵循 globals.css 中的主题色
- ⚡ 性能优化 - 仅在需要时渲染

## 使用方法

### 基础用法

```tsx
import { useGlobalLoading } from '@/hooks/use-global-loading';

function MyComponent() {
  const { showLoading, hideLoading } = useGlobalLoading();

  const handleSubmit = async () => {
    showLoading('Saving changes...');
    try {
      await saveData();
    } finally {
      hideLoading();
    }
  };

  return <button onClick={handleSubmit}>Submit</button>;
}
```

### 不带消息

```tsx
const handleAction = async () => {
  showLoading(); // 只显示 loading 动画，不显示文字
  try {
    await doSomething();
  } finally {
    hideLoading();
  }
};
```

### 在异步操作中使用

```tsx
const fetchData = async () => {
  showLoading('Loading data...');

  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    // 处理数据
  } catch (error) {
    console.error(error);
  } finally {
    hideLoading(); // 确保在 finally 中关闭 loading
  }
};
```

## API

### `useGlobalLoading()`

返回一个包含以下方法的对象：

#### `showLoading(message?: string): void`

显示全局 loading。

- `message` (可选): 显示在 loading 动画下方的提示文字

#### `hideLoading(): void`

隐藏全局 loading。

## 设计说明

- **外圈**: 旋转的边框，使用主题色的 20% 透明度
- **内圈**: 脉冲效果的光晕，使用主题色的 10% 透明度
- **中心点**: 实心圆点，使用主题色，带脉冲动画
- **背景**: 80% 透明度的背景色 + 毛玻璃效果
- **文字**: 带有动画点点点的加载提示

## 注意事项

1. 确保在 `layout.tsx` 中已经包裹了 `GlobalLoadingProvider`
2. 始终在 `finally` 块中调用 `hideLoading()` 以确保 loading 被正确关闭
3. 避免同时显示多个 loading（最后一个会覆盖前面的）
