import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { publicProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
import { db } from './../app/db/index';

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id || !user.email) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    // console.log(user.id + ' ' + user.email);

    let dbUser;

    try {
      dbUser = await db.user.findFirst({
        where: {
          id: user.id,
        },
      });
      console.log('dbUser: ' + JSON.stringify(dbUser));
    } catch (err) {
      console.log('Error fetching user from database: ' + err);
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Error fetching user from database' });
    }

    if (!dbUser) {
      try {
        dbUser = await db.user.create({
          data: {
            id: user.id,
            email: user.email,
          },
        });
        console.log('Created new user: ' + JSON.stringify(dbUser));
      } catch (err) {
        console.log('Error creating user in database: ' + err);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Error creating user in database' });
      }
    }

    // Verify dbUser is now created or fetched
    if (!dbUser) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'User creation failed' });
    }

    console.log(JSON.stringify(dbUser) + ' ' + dbUser.email);

    return { success: true };
  }),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;