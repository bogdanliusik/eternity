echo "Generating secure secrets for production..."
echo ""

# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
echo "JWT_SECRET_KEY=$JWT_SECRET"
echo ""

# Generate PostgreSQL password
POSTGRES_PASS=$(openssl rand -base64 32 | tr -d '\n')
echo "POSTGRES_PASSWORD=$POSTGRES_PASS"
echo ""

echo "Copy these values to your .env file"
echo "IMPORTANT: Keep these secrets safe and never commit them to git!"