
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { GET } from "@/app/api/auth/[...nextauth]/route";

const BossPage = async () => {
  const session = await getServerSession(GET);

  if (!session) {
    redirect("/boss/login");
  }

  // Type assertion for session object
  const typedSession = session as { user?: { email?: string } } | null;

  return (
    <div>
      <h1>Welcome to the Admin Panel</h1>
      <p>You are logged in as {typedSession?.user?.email || 'Unknown User'}</p>
    </div>
  );
};

export default BossPage;
