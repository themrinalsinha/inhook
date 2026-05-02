import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";

const WEBHOOK_STORAGE_KEY = "webhook_object";

export const SharePage = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  useEffect(() => {
    const sharedToken = token?.trim();

    if (!sharedToken) {
      navigate("/app", { replace: true });
      return;
    }

    localStorage.setItem(
      WEBHOOK_STORAGE_KEY,
      JSON.stringify({
        id: 0,
        token: sharedToken,
        created_at: new Date().toISOString(),
      })
    );

    navigate("/app", { replace: true });
  }, [navigate, token]);

  return null;
};
