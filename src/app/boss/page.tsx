
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

const BossPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/boss/login");
  }

  return (
    <div>
      <h1>Welcome to the Admin Panel</h1>
      <p>You are logged in as {session.user?.email}</p>
    </div>
  );
};

export default BossPage;
