export default function Footer() {
  return (
    <footer className="bg-light border-top mt-4">
      <div className="container py-3 text-center small text-muted">
        © {new Date().getFullYear()} PriceClub • All rights reserved
      </div>
    </footer>
  );
}
