import 'reflect-metadata';
import express from 'express';
import { DataSource } from 'typeorm';
import { User } from './entity/User';
import { Post } from './entity/Post';

const app = express();
app.use(express.json());

// Configuração da conexão com o banco de dados usando TypeORM
const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "test_db",
  entities: [User, Post],
  synchronize: true,
});

const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Data Source has been initialized!");
  } catch (err) {
    console.error("Error during Data Source initialization:", err);
    process.exit(1);
  }
};

// Inicializar o banco de dados
initializeDatabase();

// Endpoint para criar um novo usuário
app.post('/users', async (req, res) => {
  const { firstName, lastName, email } = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  try {
    const userRepository = AppDataSource.getRepository(User);
    const newUser = userRepository.create({ firstName, lastName, email });
    await userRepository.save(newUser);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar o usuário." });
  }
});

// Endpoint para criar um novo post
app.post('/posts', async (req, res) => {
  const { title, description, userId } = req.body;

  if (!title || !description || !userId) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  try {
    const postRepository = AppDataSource.getRepository(Post);
    const userRepository = AppDataSource.getRepository(User);

    // Verifica se o usuário existe
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const newPost = postRepository.create({ title, description, userId });
    await postRepository.save(newPost);
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar o post." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
