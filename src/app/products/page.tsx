import { redirect } from 'next/navigation';

export default function ProductsListRedirect() {
  // Redirect fra gammelt URL-format (/products) til nyt (/product)
  redirect('/product');
} 