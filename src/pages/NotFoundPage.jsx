import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-4xl font-bold">404 - Page Non Trouvée</h1>
      <p className="mt-4 text-lg">Désolé, la page que vous cherchez n'existe pas.</p>
      <Link to="/" className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg shadow-lg">
        Retour à l'Accueil
      </Link>
    </div>
  );
}

export default NotFoundPage;
