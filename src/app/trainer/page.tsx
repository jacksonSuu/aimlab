import type { Metadata } from "next";

import { TrainerClient } from "@/app/trainer/trainer-client";

export const metadata: Metadata = {
  title: "训练场",
};

export default function TrainerPage() {
  return (
    <TrainerClient />
  );
}
