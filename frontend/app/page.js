import { redirect } from "next/navigation";

// Root page ("/") pe koi aaye toh seedha products list pe bhej do
// Yeh Server Component hai — redirect server pe hi ho jata hai
export default function Home() {
  redirect("/products");
}
