export default function Contact() {
  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-brand-slate mb-8">Contact Us</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-xl font-semibold text-brand-slate mb-4">Get in Touch</h2>
          <div className="space-y-4">
            <p className="flex items-center text-gray-600">
              <span className="font-semibold mr-2">Email:</span>
              info@housemove.com
            </p>
            <p className="flex items-center text-gray-600">
              <span className="font-semibold mr-2">Phone:</span>
              (555) 123-4567
            </p>
            <p className="flex items-center text-gray-600">
              <span className="font-semibold mr-2">Address:</span>
              123 Moving Street, City, State 12345
            </p>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-brand-slate mb-4">Business Hours</h2>
          <div className="space-y-2 text-gray-600">
            <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
            <p>Saturday: 9:00 AM - 4:00 PM</p>
            <p>Sunday: Closed</p>
          </div>
        </div>
      </div>
    </div>
  );
}