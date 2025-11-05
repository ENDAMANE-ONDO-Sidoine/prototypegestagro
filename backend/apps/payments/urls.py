"""
URLs pour l'application payments
"""
from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    # Paiements
    path('', views.PaymentListView.as_view(), name='payment-list'),
    path('<uuid:payment_id>/', views.PaymentDetailView.as_view(), name='payment-detail'),
    
    # Webhooks
    path('webhooks/<str:provider>/', views.webhook_handler, name='webhook-handler'),
    
    # Événements webhook (pour debugging)
    path('webhook-events/', views.WebhookEventListView.as_view(), name='webhook-event-list'),
]

