import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import { Configuration, OpenAIApi } from 'openai'

dotenv.config()

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello from Career Path AI!'
  })
})

app.post('/', async (req, res) => {
  try {
    const skills = req.body.skills;
    const enjoys = req.body.enjoys;
    const balance = req.body.balance;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
prompt: `As an expert consultant, please advise me on the best choice between ${skills} and ${balance}. Please provide your response in the following format:

1. Decision: A paragraph detailing the decision.
2. Explanation: Bullet pointed list of reasons why the decision is the best choice, and why the other option is not. Bullet points only. End.
`,
      temperature: 0,
      max_tokens: 3500,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    res.status(200).send({
      bot: response.data.choices[0].text
    });

  } catch (error) {
    console.error(error)
    res.status(500).send(error || 'Something went wrong');
  }
})

app.listen(5003, () => console.log('Career Path AI server started on http://localhost:5003'));
