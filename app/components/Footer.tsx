export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto px-4">
        <p className="text-center text-gray-500 text-sm font-semibold">
          &copy; {new Date().getFullYear()} SPEED Project. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

