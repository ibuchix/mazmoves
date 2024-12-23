export default function Services() {
  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-[#040480] mb-8">Our Services</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-[#040480] mb-4">Residential Moving</h2>
          <p className="text-gray-600">Professional home moving services tailored to your needs. We handle everything from packing to transportation.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-[#040480] mb-4">Commercial Moving</h2>
          <p className="text-gray-600">Efficient business relocation services with minimal disruption to your operations. Expert handling of office equipment.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-[#040480] mb-4">Packing Services</h2>
          <p className="text-gray-600">Professional packing and unpacking services using high-quality materials to ensure your belongings arrive safely.</p>
        </div>
      </div>
    </div>
  );
}