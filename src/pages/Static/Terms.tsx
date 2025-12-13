
import { Card, CardContent } from '@/components/ui/Card';

export const Terms = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-slate-900">Terms of Service</h1>
      <Card>
        <CardContent className="prose prose-slate max-w-none pt-6">
          <p>Last updated: December 14, 2025</p>
          <h3>1. Acceptance of Terms</h3>
          <p>
            By accessing and using Sampark Setu, you agree to be bound by these Terms of Service.
          </p>
          <h3>2. User Responsibilities</h3>
          <p>
            You agree to use the platform responsibly and to submit accurate information when reporting issues.
            Misuse of the platform may result in account suspension.
          </p>
          <h3>3. Disclaimer</h3>
          <p>
            The platform is provided "as is" without warranties of any kind. We generally aim to resolve issues promptly but do not guarantee specific resolution times.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
