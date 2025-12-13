
import { Card, CardContent } from '@/components/ui/Card';

export const Privacy = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-slate-900">Privacy Policy</h1>
      <Card>
        <CardContent className="prose prose-slate max-w-none pt-6">
          <p>Last updated: December 14, 2025</p>
          <h3>1. Information We Collect</h3>
          <p>
            When you use Sampark Setu, we collect information you provide, such as issue reports, photos, and location data.
            If you create an account, we collect your name and contact details.
          </p>
          <h3>2. How We Use Information</h3>
          <p>
            We use your information to:
            <ul>
                <li>Process and resolve civic issues.</li>
                <li>Communicate with you regarding your reports.</li>
                <li>Improve our services and platform.</li>
            </ul>
          </p>
          <h3>3. Data Security</h3>
          <p>
            We implement appropriate security measures to protect your personal information from unauthorized access.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
