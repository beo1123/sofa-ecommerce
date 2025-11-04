"use client";

import { useAppSelector } from "@/store/hook";
import { clearUser, setUser } from "@/store/slice/userSlice";
import { User } from "@/types/user/User";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export function useUserSync() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const currentUser = useAppSelector((s) => s.user);

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user) {
      const user: User = {
        id: Number(session.user.id),
        email: session.user.email!,
        displayName: session.user.name ?? "",
        roles: session.user.roles ?? "",
      };

      if (!currentUser || currentUser.email !== user.email) {
        dispatch(setUser(user));
      }
    } else {
      dispatch(clearUser());
    }
  }, [session, status, dispatch, currentUser]);

  return { user: currentUser, status };
}
