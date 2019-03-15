import 'cross-fetch/polyfill';
import prisma from '../src/prisma';
import seedDatabase, { userOne } from './utils/seedDatabase';
import getClient from './utils/getClient';
import {createUser, getUsers, login, getProfile} from './utils/operations';
const client = getClient();
jest.setTimeout(10000);
beforeEach(seedDatabase);

test('Should create a new user', async (done) => {

    const variables = {
        data: {
            name: 'Andrew',
            email: 'andrew@example.com',
            password: 'MyPass123'
        }
    };
    
    const response = await client.mutate({
        mutation: createUser,
        variables
    });

    const userExists = await prisma.exists.User({
        id: response.data.createUser.user.id
    });

    expect(userExists).toBe(true);
    done();

});

test('Should expose public author profiles', async (done) => {
    const response = await client.query({
        query: getUsers
    });
    expect(response.data.users.length).toBe(2);
    expect(response.data.users[0].email).toBe(null);
    expect(response.data.users[0].name).toBe('Jen');
    done();
});

test('Should not login with bad credentials', async (done) => {
    const variables = {
        data: {
            email: "jen@example.com",
            password: "incorrect123"
        }
    };
    await expect(
        client.mutate({ 
            mutation: login,
            variables
        })
    ).rejects.toThrow();    
    done();
});

test('Should not sign up user with invalid password', async (done) => {
    const variables = {
        data: {
            name: 'Andrew Mead',
            email: 'andrew@example.com',
            password: 'short'
        }
    };
    await expect(
        client.mutate({ 
                mutation: createUser,
                variables
            })
    ).rejects.toThrow();
    done();
});

test('Should fetch user profile', async (done) => {
    const client = getClient(userOne.jwt);
    const { data } = await client.query({ query: getProfile });
    expect(data.me.id).toBe(userOne.user.id);
    expect(data.me.name).toBe(userOne.user.name);
    expect(data.me.email).toBe(userOne.user.email);
    done();
});