"""
Interface de base pour les providers de paiement
"""
from abc import ABC, abstractmethod
from typing import Dict, Optional, Any
from decimal import Decimal


class PaymentProvider(ABC):
    """
    Interface abstraite pour les providers de paiement
    """
    
    def __init__(self, api_key: str, api_secret: str, **kwargs):
        """
        Initialise le provider avec les credentials
        
        Args:
            api_key: Clé API du provider
            api_secret: Secret API du provider
            **kwargs: Paramètres additionnels spécifiques au provider
        """
        self.api_key = api_key
        self.api_secret = api_secret
        self.kwargs = kwargs
    
    @abstractmethod
    def create_payment(
        self,
        amount: Decimal,
        currency: str,
        order_reference: str,
        customer_phone: str,
        customer_name: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Crée un paiement auprès du provider
        
        Args:
            amount: Montant du paiement
            currency: Devise (XAF, etc.)
            order_reference: Référence de la commande
            customer_phone: Numéro de téléphone du client
            customer_name: Nom du client
            metadata: Métadonnées additionnelles
            
        Returns:
            Dict contenant:
                - transaction_id: ID de transaction du provider
                - reference: Référence du paiement
                - status: Statut initial ('pending', 'processing', etc.)
                - payment_url: URL de paiement (si applicable)
                - metadata: Métadonnées additionnelles
                
        Raises:
            PaymentProviderError: En cas d'erreur lors de la création
        """
        pass
    
    @abstractmethod
    def verify_payment(self, transaction_id: str) -> Dict[str, Any]:
        """
        Vérifie le statut d'un paiement
        
        Args:
            transaction_id: ID de transaction du provider
            
        Returns:
            Dict contenant:
                - status: Statut du paiement ('succeeded', 'failed', 'pending', etc.)
                - amount: Montant payé
                - currency: Devise
                - paid_at: Date de paiement (si payé)
                - metadata: Métadonnées additionnelles
                
        Raises:
            PaymentProviderError: En cas d'erreur lors de la vérification
        """
        pass
    
    @abstractmethod
    def verify_webhook_signature(
        self,
        payload: str,
        signature: str,
        secret: Optional[str] = None
    ) -> bool:
        """
        Vérifie la signature d'un webhook
        
        Args:
            payload: Corps du webhook (string)
            signature: Signature fournie dans les headers
            secret: Secret pour la vérification (optionnel, utilise self.api_secret par défaut)
            
        Returns:
            True si la signature est valide, False sinon
        """
        pass
    
    @abstractmethod
    def parse_webhook_event(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse un événement webhook du provider
        
        Args:
            payload: Payload du webhook
            
        Returns:
            Dict contenant:
                - event_type: Type d'événement ('payment.succeeded', 'payment.failed', etc.)
                - transaction_id: ID de transaction
                - order_reference: Référence de la commande
                - status: Statut du paiement
                - amount: Montant
                - metadata: Métadonnées additionnelles
        """
        pass
    
    def refund_payment(
        self,
        transaction_id: str,
        amount: Optional[Decimal] = None,
        reason: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Effectue un remboursement (optionnel, à implémenter si supporté)
        
        Args:
            transaction_id: ID de transaction à rembourser
            amount: Montant à rembourser (None = remboursement total)
            reason: Raison du remboursement
            
        Returns:
            Dict contenant les informations du remboursement
            
        Raises:
            NotImplementedError: Si le provider ne supporte pas les remboursements
        """
        raise NotImplementedError(f"{self.__class__.__name__} ne supporte pas les remboursements")


class PaymentProviderError(Exception):
    """Exception générique pour les erreurs de provider de paiement"""
    pass


class PaymentProviderConfigurationError(PaymentProviderError):
    """Erreur de configuration du provider"""
    pass


class PaymentProviderAPIError(PaymentProviderError):
    """Erreur lors de l'appel API du provider"""
    pass

