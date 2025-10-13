export default function Header() {
  return (
    <header className="bg-black text-white p-4 flex justify-between items-center">
      <div className="font-bold text-xl">Shovra</div>
      <nav>
        <ul className="flex gap-4">
          <li>Products</li>
          <li>Cart</li>
          <li>Dashboard</li>
        </ul>
      </nav>
    </header>
  );
}
