const fs = require('fs');

const dict = {
  "ltr": "ltr",
  "Boutique actuelle": "Current Store",
  "Plan actuel: Gratuit": "Current Plan: Free",
  "Passez au niveau supérieur pour un domaine personnalisé.": "Upgrade to get a custom domain.",
  "Mettre à niveau": "Upgrade",
  "Rechercher des produits, commandes...": "Search products, orders...",
  "Paramètres": "Settings",
  "Déconnexion": "Logout",
  "Bienvenue sur GZeed 👋": "Welcome to GZeed 👋",
  "Configurons votre projet pour le lancer.": "Let's set up your project for launch.",
  "Voir la boutique": "View Store",
  "Ajouter un produit": "Add Product",
  "Guide de configuration rapide": "Quick Setup Guide",
  "Complétez ces étapes pour commencer à vendre.": "Complete these steps to start selling.",
  "Choisissez un nom pour votre projet": "Choose a name for your project",
  "Vous n\\'avez pas encore nommé votre boutique.": "You haven't named your store yet.",
  "Ajouter un nom →": "Add name →",
  "Personnaliser l\\'apparence": "Customize appearance",
  "Choisissez un thème et modifiez-le facilement.": "Choose a theme and customize it easily.",
  "Ajoutez votre premier produit": "Add your first product",
  "Téléchargez des images et une description.": "Upload images and a description.",
  "Vous êtes sur la bonne voie !": "You are on the right track!",
  "Terminez la configuration pour lancer votre projet": "Finish setup to launch your project",
  "Que voulez-vous construire aujourd\\'hui ?": "What do you want to build today?",
  "Boutique E-commerce": "E-commerce Store",
  "Plateforme complète pour vendre vos produits avec panier.": "Complete platform to sell your products with a cart.",
  "Explorer les thèmes": "Explore Themes",
  "Site Vitrine": "Showcase Website",
  "Site professionnel pour votre entreprise ou portfolio.": "Professional site for your business or portfolio.",
  "Application Mobile": "Mobile App",
  "Transformez votre projet en application professionnelle.": "Turn your project into a professional app.",
  "S\\'inscrire à la liste": "Join the waitlist",
  "Commandes": "Orders",
  "Gérez et suivez toutes vos commandes.": "Manage and track all your orders.",
  "Aucune commande pour le moment": "No orders yet",
  "Lorsque les clients achèteront sur votre boutique, leurs commandes apparaîtront ici.": "When clients buy from your store, their orders will appear here.",
  "Comment augmenter mes ventes ?": "How to increase my sales?",
  "Produits": "Products",
  "Ajoutez vos produits et commencez à vendre.": "Add your products and start selling.",
  "Configurez vos produits, prix et images pour commencer.": "Configure your products, prices, and images to get started.",
  "Thèmes & Design": "Themes & Design",
  "Choisissez le thème adapté à votre forfait.": "Choose the theme that fits your plan.",
  "Tous": "All",
  "E-commerce": "E-commerce",
  "Sites Vitrine": "Showcase Sites",
  "Développeurs": "Developers",
  "Minimalist Fashion": "Minimalist Fashion",
  "Boutique E-commerce Mode": "Fashion E-commerce Store",
  "Abaya Fashion": "Abaya Fashion",
  "Boutique E-commerce Abayas": "Abayas E-commerce Store",
  "Luxury Perfume": "Luxury Perfume",
  "Boutique E-commerce Parfums": "Perfume E-commerce Store",
  "Digital Store": "Digital Store",
  "Pour vendre des abonnements": "To sell subscriptions",
  "Dentist Clinic": "Dentist Clinic",
  "Site vitrine pour clinique": "Showcase site for clinic",
  "Omra & Tours": "Omra & Tours",
  "Site pour agence de voyage": "Travel agency site",
  "Thème Vide (Dev)": "Blank Theme (Dev)",
  "Créez depuis zéro avec du code": "Create from scratch with code",
  "Store": "Store",
  "Site": "Site",
  "Utiliser ce thème": "Use this theme",
  "Éditeur Visuel": "Visual Editor",
  "Modifiez chaque partie de votre site avec notre outil glisser-déposer. Aucune expérience requise !": "Edit every part of your site with our drag-and-drop tool. No experience required!",
  "Ouvrir l\\'éditeur maintenant": "Open the editor now",
  "Paramètres de la boutique": "Store Settings",
  "Informations générales": "General Information",
  "Modifier les infos": "Edit Info",
  "Nom de la boutique": "Store Name",
  "Description de la boutique": "Store Description",
  "Ajoutez une courte description...": "Add a short description...",
  "Annuler": "Cancel",
  "Informations enregistrées !": "Information saved!",
  "Enregistrer": "Save",
  "Domaine": "Domain",
  "Modifier le domaine": "Edit Domain",
  "Sous-domaine gratuit": "Free Subdomain",
  "Domaine personnalisé PRO": "Custom Domain PRO",
  "Choisissez un nom pour votre projet avant .gzeed.com": "Choose a name for your project before .gzeed.com",
  "Domaine enregistré ! Choisissez maintenant votre thème.": "Domain saved! Now choose your theme.",
  "Connectez votre propre domaine (ex: www.mystore.com).": "Connect your custom domain (ex: www.mystore.com).",
  "Domaine connecté ! Choisissez maintenant votre thème.": "Domain connected! Now choose your theme.",
  "Connecter": "Connect",
  "Paramètres DNS requis :": "Required DNS Settings:",
  "Ajoutez cet enregistrement dans votre panneau de contrôle DNS :": "Add this record in your DNS control panel:",
  "Page en cours de développement": "Page under development",
  "Accueil": "Home",
  "Analytique": "Analytics",
  "Clients": "Customers"
};

const filePath = 'C:/Users/hp/Downloads/GZeed/src/pages/GZeedDashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const regex = /isAr \? '([^']+)' \s*:\s* '([^']+)'/g;
content = content.replace(regex, (match, ar, fr) => {
  const en = dict[fr] || fr;
  return `lang === 'ar' ? '${ar}' : lang === 'en' ? '${en}' : '${fr}'`;
});

// Fix labelFr/labelAr logic for English
content = content.replace(
  /{isAr \? item\.labelAr : item\.labelFr}/g,
  `{lang === 'ar' ? item.labelAr : lang === 'en' ? item.labelEn : item.labelFr}`
);

// Update navItems definition to include labelEn
const navItemsRegex = /labelFr: '([^']+)'(?!, labelEn)/g;
content = content.replace(navItemsRegex, (match, fr) => {
  return `labelFr: '${fr}', labelEn: '${dict[fr] || fr}'`;
});

fs.writeFileSync(filePath, content);
console.log('Successfully updated GZeedDashboard translations');
