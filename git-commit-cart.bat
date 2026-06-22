@echo off
cd /d "C:\Users\Ricko\owl-website"
echo === OWL Cart Checkout Commit ===
echo Removing any stale lock files...
del /f ".git\index.lock" 2>nul
del /f ".git\HEAD.lock" 2>nul
echo Rebuilding git index from HEAD...
git read-tree HEAD
echo Staging all changes...
git add -A
echo Committing...
git commit -m "feat: full cart system + multi-item PayPal checkout

- CartContext (useReducer, localStorage owl-cart-v1, openDrawer/closeDrawer)
- CartDrawer (slide-over panel, qty steppers, remove, subtotal, PayPal CTA)
- AddToCartButton (client component, opens drawer on add)
- CartPayPalCheckout (reads cart context, sends items[] to API)
- /api/paypal/create-order rewritten — accepts items[] or legacy slug
- /api/paypal/capture-order rewritten — multi-item, re-validates all prices
- /api/webhooks/paypal patched — PAYPAL_BASE replaces hardcoded sandbox URL
- SiteHeader: cart badge with item count, openDrawer on bag icon click
- Marketing layout: CartProvider + CartDrawer mounted once
- Spiral Notebook image restored (1.5MB real product photo)
- order-confirmation: displays full item list from URL params
- tsc: zero errors; ESLint: zero new warnings on new files"
echo Pushing to origin...
git push
echo === Done ===
pause
