import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth";
import { useTransition } from "react";
import { toast } from "sonner";

export function AuthenticateWithGoogle() {

  const [isSigninWithGoogle, setIsSigninWithGoogle] = useTransition();

  async function handleSigninWithGoogle() {
    setIsSigninWithGoogle(async () => {
      await authClient.signIn.social(
        {
          provider: "google",
          callbackURL: `${window.location.origin}/orgs`,
          errorCallbackURL: `${window.location.origin}/auth`,
        },
        {
          onError: ({ error }) => {
            toast.error('Failed to sign in with Google!', {
              description: error.message
            })
          }
        }
      );
    });
  }

  return (
    <Button type="button" disabled={isSigninWithGoogle} className="w-full bg-[#DB4437] text-white hover:bg-[#DB4437]/90" onClick={handleSigninWithGoogle}>
      {isSigninWithGoogle && <Spinner/>}
      Continue with Google
    </Button>
  );
}
