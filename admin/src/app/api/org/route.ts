import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

const CATCH_ERROR_MSG = 'Failed to retrieve organization users';
const NOT_FOUND_ERROR_MSG = 'Organization user not found';
const RESP_ERROR_MSG = 'Failed to find organization user';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderBy: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const client = await clerkClient();
    const organizationList = await client.organizations.getOrganizationList();

    const adminOrg = organizationList.data.find(
      (org) => org.name.toLowerCase() === 'admin' || org.slug === 'admin'
    );

    if (!adminOrg) {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin organization not found',
          message: 'Admin organization not found'
        },
        { status: 404 }
      );
    }

    const members = await client.organizations.getOrganizationMembershipList({
      organizationId: adminOrg.id
    });

    return NextResponse.json({
      success: true,
      data: members,
      metadata: {
        fetchedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error(CATCH_ERROR_MSG);

    if (error.status === 403) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied'
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: RESP_ERROR_MSG,
        message: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
