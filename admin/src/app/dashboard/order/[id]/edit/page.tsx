import NotFound from '@/features/order/component/not-found';
import OrderEditorView from '@/features/order/view/order-editor-view';
import { getOrderById } from '@/repositories/order/order.repo';

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params;

  const order = await getOrderById(id);

  if (!order) {
    return <NotFound />;
  }

  return <OrderEditorView order={order} />;
};

export default Page;
