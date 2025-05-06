// src/orderHandler.ts
import { Request, Response } from 'express';
import prisma from './prismaClient';

export const handleOrderRequest = async (req: Request, res: Response): Promise<Response> => {
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

  try {
    // 4. Prisma를 통한 주문 정보 저장
    const savedOrder = await prisma.order.create({
      data: {
        userId: order.user.id,
        userType: order.user.userType,
        userPhone: order.user.phoneNumber,
        receiverPhone: order.phoneNumber,
        address1: order.address1,
        address2: order.address2,
        deliveryDate: new Date(order.deliveryDate),
        deliveryRequest: order.deliveryRequest,
        otherRequests: order.otherRequests,
        description: order.description,
        totalPrice: calculatedTotal,
        itemCount: itemCount
      }
    });

    return res.status(200).json({
      success: true,
      orderId: savedOrder.id,
      totalPrice: savedOrder.totalPrice,
      itemCount: savedOrder.itemCount,
      estimatedDeliveryDate: savedOrder.deliveryDate.toISOString().split('T')[0],
      message: '주문이 성공적으로 접수되었습니다.'
    });
  } catch (error) {
    console.error('DB 저장 오류:', error);
    return res.status(500).json({ success: false, message: '서버 내부 오류' });
  }
};