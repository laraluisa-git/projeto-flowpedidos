#### Dicas: 
* Para rodar o docker pela primeira vez
1 - Criar a imagem:
docker build -t flowpedidos-api .
2 - Rodar o container:
docker run -p 3000:3000 --env-file .env --name api-flowpedidos flowpedidos-api



Gerar Hash de senha: 
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('SUA SENHA', 10, (err, hash) => console.log(hash))"