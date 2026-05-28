import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

// Lindungi rute utama dan pastikan bypass asset statis & endpoint API auth
export const config = {
  matcher: [
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico|manifest.json).*)"
  ]
};