
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export const Contact = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-slate-900">Contact Us</h1>
      <Card>
        <CardHeader>
          <CardTitle>Get in Touch</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600">
            We value your feedback and are here to assist you. Please reach out to us using the contact details below.
          </p>
          <div className="mt-4">
            <h3 className="font-semibold text-slate-800">Address</h3>
            <p className="text-slate-600">Sampark Setu HQ, Jaipur, Rajasthan, 302001</p>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold text-slate-800">Email</h3>
            <p className="text-slate-600">support@samparksetu.gov.in</p>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold text-slate-800">Phone</h3>
            <p className="text-slate-600">+91 141 123 4567</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
