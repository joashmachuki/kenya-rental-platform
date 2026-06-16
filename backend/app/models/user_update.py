# Add these relationships to your existing User model in users.py
# Paste this inside the User class, after existing columns:

    transactions = relationship("PaymentTransaction", back_populates="user")
    subscription = relationship("LandlordSubscription", back_populates="user", uselist=False)
