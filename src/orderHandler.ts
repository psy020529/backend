// src/orderHandler.ts
import { Request, Response } from 'express';

export const handleOrderRequest = (req: Request, res: Response): Response => {
  const order = req.body;

  // 1. 주문자 및 수령자 정보 검증
  if (!order.user || !order.phoneNumber || !order.address1 || !order.deliveryDate) {
    return res.status(400).json({ success: false, message: '필수 정보 누락' });
  }

  // 2. cartItems 검사 및 가격 계산
  let calculatedTotal = 0;
  let itemCount = 0;

  for (const item of order.cartItems) {
    if (item.category === 'door') {
      if (!item.width || !item.height || !item.price || !item.count) {
        return res.status(400).json({ success: false, message: '문짝 정보 누락' });
      }
      calculatedTotal += item.price * item.count;
      itemCount += item.count;
    }
  }

  // 3. 총 가격 검증
  if (order.totalPrice !== calculatedTotal) {
    return res.status(422).json({ success: false, message: '가격 불일치' });
  }

  // 4. 응답 반환 (DB 저장은 생략됨)
  return res.status(200).json({
    success: true,
    orderId: 1234, // 예시용
    totalPrice: calculatedTotal,
    itemCount,
    estimatedDeliveryDate: '2025-05-14',
    message: '주문이 성공적으로 접수되었습니다.'
  });
};
