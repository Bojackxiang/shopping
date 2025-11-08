import { clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const clerk = await clerkClient();

    const user = await clerk.users.getUser(userId);

    const userDetails = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),

      emailAddresses:
        user.emailAddresses?.map((email) => ({
          id: email.id,
          emailAddress: email.emailAddress,
          verified: email.verification?.status === 'verified'
        })) || [],
      primaryEmail: user.emailAddresses?.[0]?.emailAddress || null,

      phoneNumbers:
        user.phoneNumbers?.map((phone) => ({
          id: phone.id,
          phoneNumber: phone.phoneNumber,
          verified: phone.verification?.status === 'verified'
        })) || [],

      imageUrl: user.imageUrl,
      hasImage: user.hasImage,

      publicMetadata: user.publicMetadata,
      role: user.publicMetadata?.role || 'user',
      department: user.publicMetadata?.department || null,
      permissions: user.publicMetadata?.permissions || [],
      customFields: user.publicMetadata?.customFields || {},

      // 账户状态
      banned: user.banned,
      locked: user.locked,
      passwordEnabled: user.passwordEnabled,
      twoFactorEnabled: user.twoFactorEnabled,
      totpEnabled: user.totpEnabled,
      backupCodeEnabled: user.backupCodeEnabled,

      // 时间信息
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastSignInAt: user.lastSignInAt,
      lastActiveAt: user.lastActiveAt
    };

    return NextResponse.json({
      success: true,
      data: userDetails,
      metadata: {
        fetchedAt: new Date().toISOString(),
        source: 'clerk_api',
        userId: user.id
      }
    });
  } catch (error: any) {
    console.error('Error fetching user details:', error);

    // 处理不同类型的错误
    if (error.status === 404) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
          userId: (await params).userId
        },
        { status: 404 }
      );
    }

    if (error.status === 403) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied',
          userId: (await params).userId
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user details',
        message: error.message || 'Unknown error',
        userId: (await params).userId
      },
      { status: 500 }
    );
  }
}

// 可选：添加 PATCH 方法来更新用户的 Public Metadata
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const clerk = await clerkClient();

    // 更新用户的 Public Metadata
    const updatedUser = await clerk.users.updateUser(userId, {
      publicMetadata: {
        ...body.publicMetadata
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        publicMetadata: updatedUser.publicMetadata,
        updatedAt: updatedUser.updatedAt
      },
      message: 'User metadata updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating user:', error);

    // 处理不同类型的错误
    if (error.status === 404) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
          userId: (await params).userId
        },
        { status: 404 }
      );
    }

    if (error.status === 403) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied',
          userId: (await params).userId
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user',
        message: error.message || 'Unknown error',
        userId: (await params).userId
      },
      { status: 500 }
    );
  }
}
