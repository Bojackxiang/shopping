# ConfirmDialog 使用指南

一个现代化、可复用的确认对话框组件系统，支持多种类型和异步操作。

## 功能特点

- ✨ 简洁优雅的 2025 现代化设计
- 🎨 4 种预设类型：info、warning、danger、success
- ⚡️ 支持异步操作，自动处理 loading 状态
- 🎯 通过 Hook 轻松调用，无需手动管理状态
- 🔄 可在任何组件中复用
- 🎭 平滑的动画过渡效果
- 🌈 符合项目配色方案

## 基础使用

### 1. 导入 Hook

```tsx
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
```

### 2. 在组件中使用

```tsx
"use client";

import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { Button } from "@/components/ui/button";

export default function MyComponent() {
  const { confirm, confirmDanger } = useConfirmDialog();

  // 普通确认
  const handleDelete = () => {
    confirm(
      {
        title: "Delete Item",
        description:
          "Are you sure you want to delete this item? This action cannot be undone.",
        type: "danger",
        confirmText: "Delete",
        cancelText: "Cancel",
      },
      async () => {
        // 执行异步删除操作
        await deleteItem();
        console.log("Item deleted successfully");
      },
    );
  };

  // 使用快捷方法
  const handleQuickDelete = () => {
    confirmDanger(
      "Delete Address",
      "This will permanently remove your shipping address. Continue?",
      async () => {
        await deleteAddress();
      },
    );
  };

  return (
    <div>
      <Button onClick={handleDelete}>Delete Item</Button>
      <Button onClick={handleQuickDelete}>Quick Delete</Button>
    </div>
  );
}
```

## API 参考

### useConfirmDialog Hook

返回以下方法：

#### `confirm(options, onConfirm)`

通用确认方法，支持完全自定义。

**Options:**

- `title: string` - 对话框标题
- `description: string` - 对话框描述内容
- `type?: 'info' | 'warning' | 'danger' | 'success'` - 对话框类型（默认：'info'）
- `confirmText?: string` - 确认按钮文字（默认：'Confirm'）
- `cancelText?: string` - 取消按钮文字（默认：'Cancel'）
- `onCancel?: () => void` - 取消时的回调函数（可选）

**onConfirm:**

- 类型：`() => void | Promise<void>`
- 确认时执行的函数，支持同步和异步操作

#### `confirmInfo(title, description, onConfirm)`

快捷方法，用于信息类型的确认。

```tsx
confirmInfo(
  "Save Changes",
  "Do you want to save your changes before leaving?",
  async () => {
    await saveChanges();
  },
);
```

#### `confirmWarning(title, description, onConfirm)`

快捷方法，用于警告类型的确认。

```tsx
confirmWarning(
  "Unsaved Changes",
  "You have unsaved changes. Are you sure you want to leave?",
  () => {
    router.push("/");
  },
);
```

#### `confirmDanger(title, description, onConfirm)`

快捷方法，用于危险操作的确认（如删除）。按钮文字自动为 "Delete"。

```tsx
confirmDanger(
  "Delete Account",
  "This action is irreversible. All your data will be permanently deleted.",
  async () => {
    await deleteAccount();
  },
);
```

#### `confirmSuccess(title, description, onConfirm)`

快捷方法，用于成功类型的确认。

```tsx
confirmSuccess(
  "Order Confirmed",
  "Your order has been placed successfully. Would you like to view the details?",
  () => {
    router.push("/orders");
  },
);
```

#### `hide()`

手动关闭对话框（极少使用）。

## 实际应用示例

### 删除地址

```tsx
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AddressCard({ address }) {
  const { confirmDanger } = useConfirmDialog();

  const handleDelete = () => {
    confirmDanger(
      "Delete Address",
      `Are you sure you want to delete "${address.fullName}"? This action cannot be undone.`,
      async () => {
        await fetch(\`/api/addresses/\${address.id}\`, {
          method: "DELETE",
        });
        // 刷新地址列表
        mutate("/api/addresses");
      }
    );
  };

  return (
    <div>
      <Button onClick={handleDelete} variant="ghost">
        <Trash2 className="w-4 h-4" />
        Delete
      </Button>
    </div>
  );
}
```

### 取消订单

```tsx
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";

export default function OrderActions({ orderId }) {
  const { confirm } = useConfirmDialog();

  const handleCancelOrder = () => {
    confirm(
      {
        title: "Cancel Order",
        description: "Are you sure you want to cancel this order? You will receive a full refund.",
        type: "warning",
        confirmText: "Yes, Cancel Order",
        cancelText: "Keep Order",
      },
      async () => {
        const response = await fetch(\`/api/orders/\${orderId}/cancel\`, {
          method: "POST",
        });

        if (response.ok) {
          toast.success("Order cancelled successfully");
        }
      }
    );
  };

  return <Button onClick={handleCancelOrder}>Cancel Order</Button>;
}
```

### 清空购物车

```tsx
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";

export default function CartActions() {
  const { confirmWarning } = useConfirmDialog();

  const handleClearCart = () => {
    confirmWarning(
      "Clear Shopping Cart",
      "This will remove all items from your cart. Are you sure?",
      async () => {
        await clearCart();
        toast.success("Cart cleared");
      },
    );
  };

  return <Button onClick={handleClearCart}>Clear Cart</Button>;
}
```

## 设计特点

### 视觉设计

- **现代化布局**：圆角卡片 + 毛玻璃背景
- **图标系统**：每种类型配有对应图标和颜色
- **响应式设计**：适配移动端和桌面端
- **动画效果**：淡入淡出 + 缩放效果

### 类型样式

| 类型    | 图标          | 颜色        | 用途               |
| ------- | ------------- | ----------- | ------------------ |
| info    | Info          | Primary     | 一般信息确认       |
| warning | AlertTriangle | Accent      | 警告提示           |
| danger  | AlertCircle   | Destructive | 危险操作（删除等） |
| success | CheckCircle   | Accent      | 成功确认           |

### 交互体验

- ✅ 自动处理异步操作的 loading 状态
- ✅ Loading 时显示旋转动画和 "Processing..." 文字
- ✅ 禁止在 loading 时关闭对话框
- ✅ 操作完成后自动关闭
- ✅ 支持 ESC 键关闭
- ✅ 点击遮罩层关闭

## 注意事项

1. **Provider 已集成**：已在 `app/layout.tsx` 中添加，无需再次配置
2. **客户端组件**：使用 Hook 的组件必须是客户端组件（添加 `"use client"`）
3. **异步操作**：`onConfirm` 支持 Promise，会自动等待完成
4. **错误处理**：如果异步操作失败，对话框不会关闭，便于用户重试

## 高级用法

### 自定义取消回调

```tsx
confirm(
  {
    title: "Discard Changes",
    description: "Your changes will be lost. Continue?",
    type: "warning",
    onCancel: () => {
      console.log("User cancelled");
    },
  },
  async () => {
    await discardChanges();
  },
);
```

### 链式确认

```tsx
const handleCriticalAction = () => {
  confirmWarning(
    "First Confirmation",
    "This is a critical action. Are you sure?",
    () => {
      confirmDanger(
        "Final Confirmation",
        "This is your last chance. Really proceed?",
        async () => {
          await performCriticalAction();
        },
      );
    },
  );
};
```

## 技术栈

- React Context API - 状态管理
- Radix UI Dialog - 无障碍访问
- Tailwind CSS - 样式系统
- Lucide Icons - 图标库
- TypeScript - 类型安全
