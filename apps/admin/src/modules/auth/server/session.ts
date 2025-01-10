"use server";

import { cache } from "react";

import { auth } from "./auth";

export const getServerSession = cache(auth);
