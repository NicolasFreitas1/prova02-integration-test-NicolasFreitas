import pactum from 'pactum';
import { SimpleReporter } from '../simple-reporter';
import { faker } from '@faker-js/faker';
import { StatusCodes } from 'http-status-codes';

describe('DummyJSON API - E-commerce Products', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://dummyjson.com';
  let productId: number;

  p.request.setDefaultTimeout(90000);

  beforeAll(() => p.reporter.add(rep));
  afterAll(() => p.reporter.end());

  describe('Products - Operações CRUD Completas', () => {
    it('1. GET - Listar todos os produtos (com paginação)', async () => {
      await p
        .spec()
        .get(`${baseUrl}/products?limit=10&skip=0`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  price: { type: 'number' },
                  brand: { type: 'string' },
                  category: { type: 'string' }
                },
                required: ['id', 'title', 'description', 'price']
              }
            },
            total: { type: 'number' },
            skip: { type: 'number' },
            limit: { type: 'number' }
          },
          required: ['products', 'total', 'skip', 'limit']
        })
        .expectJsonMatch({
          limit: 10,
          skip: 0
        });
    });

    it('2. GET - Buscar produto específico por ID', async () => {
      productId = 1;
      
      await p
        .spec()
        .get(`${baseUrl}/products/${productId}`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            discountPercentage: { type: 'number' },
            rating: { type: 'number' },
            stock: { type: 'number' },
            brand: { type: 'string' },
            category: { type: 'string' }
          },
          required: ['id', 'title', 'description', 'price', 'stock']
        })
        .expectJsonMatch({
          id: productId
        });
    });

    it('3. GET - Buscar produtos por categoria', async () => {
      await p
        .spec()
        .get(`${baseUrl}/products/category/smartphones`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  title: { type: 'string' },
                  category: { type: 'string' }
                }
              }
            }
          },
          required: ['products']
        });
    });

    it('4. GET - Pesquisar produtos por nome', async () => {
      await p
        .spec()
        .get(`${baseUrl}/products/search?q=phone`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            products: { type: 'array' },
            total: { type: 'number' }
          },
          required: ['products', 'total']
        });
    });

    it('5. POST - Criar novo produto', async () => {
      const newProduct = {
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price()),
        discountPercentage: faker.number.float({ min: 0, max: 20, fractionDigits: 2 }),
        rating: faker.number.float({ min: 0, max: 5, fractionDigits: 2 }),
        stock: faker.number.int({ min: 1, max: 100 }),
        brand: faker.company.name(),
        category: faker.commerce.department()
      };

      await p
        .spec()
        .post(`${baseUrl}/products/add`)
        .withJson(newProduct)
        .expectStatus(StatusCodes.CREATED)
        .expectJsonSchema({
          type: 'object',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' }
          },
          required: ['id', 'title']
        })
        .expectJsonLike({
          title: newProduct.title,
          description: newProduct.description
        });
    });

    it('6. PUT - Atualizar produto completamente', async () => {
      const updatedProduct = {
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price()),
        rating: faker.number.float({ min: 0, max: 5, fractionDigits: 2 }),
        stock: faker.number.int({ min: 1, max: 50 })
      };

      await p
        .spec()
        .put(`${baseUrl}/products/1`)
        .withJson(updatedProduct)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' }
          }
        })
        .expectJsonMatch({
          title: updatedProduct.title,
          id: 1
        });
    });

    it('7. PATCH - Atualizar produto parcialmente', async () => {
      const partialUpdate = {
        price: parseFloat(faker.commerce.price({ min: 500, max: 1000 }))
      };

      await p
        .spec()
        .patch(`${baseUrl}/products/1`)
        .withJson(partialUpdate)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            id: { type: 'number' },
            price: { type: 'number' }
          }
        })
        .expectJsonMatch({
          id: 1,
          price: partialUpdate.price
        });
    });

    it('8. DELETE - Deletar produto', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/products/1`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            id: { type: 'number' },
            isDeleted: { type: 'boolean' }
          },
          required: ['id', 'isDeleted']
        })
        .expectJsonMatch({
          id: 1,
          isDeleted: true
        });
    });
  });

  describe('Users - Operações de Usuários', () => {
    it('9. GET - Listar usuários', async () => {
      await p
        .spec()
        .get(`${baseUrl}/users?limit=5`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            users: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string' }
                },
                required: ['id', 'firstName', 'lastName', 'email']
              }
            },
            total: { type: 'number' }
          },
          required: ['users', 'total']
        });
    });

    it('10. GET - Buscar usuário por ID', async () => {
      await p
        .spec()
        .get(`${baseUrl}/users/1`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            id: { type: 'number' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' }
          },
          required: ['id', 'firstName', 'lastName', 'email']
        })
        .expectJsonMatch({
          id: 1
        });
    });

    it('11. POST - Criar novo usuário', async () => {
      const newUser = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        age: faker.number.int({ min: 18, max: 65 })
      };

      await p
        .spec()
        .post(`${baseUrl}/users/add`)
        .withJson(newUser)
        .expectStatus(StatusCodes.CREATED)
        .expectJsonSchema({
          type: 'object',
          properties: {
            id: { type: 'number' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' }
          },
          required: ['id', 'firstName', 'lastName']
        })
        .expectJsonLike({
          firstName: newUser.firstName,
          lastName: newUser.lastName
        });
    });
  });

  describe('Carts - Carrinhos de Compras', () => {
    it('12. GET - Listar carrinhos', async () => {
      await p
        .spec()
        .get(`${baseUrl}/carts?limit=3`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            carts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  products: { type: 'array' },
                  total: { type: 'number' },
                  userId: { type: 'number' }
                },
                required: ['id', 'products', 'total', 'userId']
              }
            },
            total: { type: 'number' }
          },
          required: ['carts', 'total']
        });
    });

    it('13. POST - Adicionar novo carrinho', async () => {
      const newCart = {
        userId: 1,
        products: [
          {
            id: 1,
            quantity: 2
          },
          {
            id: 5,
            quantity: 1
          }
        ]
      };

      await p
        .spec()
        .post(`${baseUrl}/carts/add`)
        .withJson(newCart)
        .expectStatus(StatusCodes.CREATED)
        .expectJsonSchema({
          type: 'object',
          properties: {
            id: { type: 'number' },
            products: { type: 'array' },
            userId: { type: 'number' }
          },
          required: ['id', 'products', 'userId']
        })
        .expectJsonMatch({
          userId: newCart.userId
        });
    });
  });
});

