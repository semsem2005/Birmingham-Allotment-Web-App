import {describe, it, expect, vi, beforeEach} from 'vitest';
import express from 'express';
import request from 'supertest';
import bulletinRouter from '../routes/bulletin.js';

describe('Bulletin routes', () => {

    beforeEach(() => {
        global.sql = vi.fn()
            .mockResolvedValueOnce(undefined) //testing await sql`delete from bulletin_board where time < NOW();`
            .mockResolvedValueOnce([
                {
                    postid: 1,
                    userid: 1,
                    type: 'Event',
                    address:'113 Pope St, B1 3AG',
                    time: '2025-06-11 14:30:00+01',
                    content: 'We are hosting an info session',
                    name: 'Testing'
                }
            ]); //testing const results = await sql`Select b.*, p.name FROM bulletin_board b JOIN profiles ON b.userID = p.userID;`

    });

    it('rendering bulletin page for logged-in users', async () => {
        const app = express();
        app.use((req, res, next) => {
            req.session = {
                user: {
                    userid: 1
                }
            };

            res.render = (view, data) => {
                res.json({ view, data});
            };

            next();
        });
        app.use('/', bulletinRouter);

        const response = await request(app).get('/');
        expect(response.status).toBe(200); //server successfully processes request
        expect(response.body.view).toBe('bulletin');
        expect(response.body.data.loggedIn).toBe(true);
    });



    it('rendering bulletin page for logged-out users', async () =>  {
    global.sql = vi.fn()
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce([]);

    const app = express();

    app.use((req, res, next) => {
        req.session = {};

        res.render = (view, data) => {
            res.json({ view, data });
        };

        next();
    });

    app.use('/', bulletinRouter);

    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body.data.loggedIn).toBe(false);


    
    });

it('creating a bulletin post and reloading to show post on board', async() => {
        var bulletinModel = require('../model/bulletin');
        bulletinModel.bulletin = vi.fn().mockResolvedValue();
        const app = express();

        app.use(express.urlencoded({extended: false}));

        app.use((req, res, next) => {
            req.session = {
                user: {
                    id: 1
                }
            };

            next();
        });

        app.use('/bulletin', bulletinRouter);

        const response = await request(app)
        .post('/bulletin')
        .type('form')
        .send({
            typeSelect: 'Event',
            postAddressInput: '113 Pope St, B1 3AG',
            eventDateInput: '2026-06-12',
            eventTimeInput: '12:30',
            postContentInput: 'Info Session on fruit'
        });

        expect(bulletinModel.bulletin).toHaveBeenCalledWith(
            1,
            'Event',
            '113 Pope St, B1 3AG',
            '2026-06-12 12:30:00',
            'Info Session on fruit'
        );
        expect(response.status).toBe(302)//request resource has been temporarily relocated to a different URL
        expect(response.headers.location).toBe('/bulletin');
    })
});

