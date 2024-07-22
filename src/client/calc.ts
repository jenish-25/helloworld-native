import {
    Keypair,
    Connection,
    PublicKey,
    SystemProgram,
    TransactionInstruction,
    Transaction,
    sendAndConfirmTransaction,
} from '@solana/web3.js';

const PROGRAM_ID = "2Xq5xYL3YX6dzqnNjwCUqgvz9ojBkEAwSeeyhRNPJcQx"; //Paste your Program ID after deploying the Program here

const secret = [188,135,38,41,168,21,62,76,144,65,185,188,155,123,46,208,253,165,77,69,141,28,100,144,30,127,60,6,99,13,253,8,56,141,119,219,193,241,140,191,35,181,159,131,47,197,211,130,164,11,31,112,153,228,253,199,42,250,221,140,83,159,7,2]; // Paste your secret from id.json of your local solana wallet
const acc = Keypair.fromSecretKey(Uint8Array.from(secret));

const createDataAccount = async (connection: Connection, parentAccount: Keypair) => {
    const dataAccount = Keypair.generate();
    const createAccountInstruction = SystemProgram.createAccount({
        fromPubkey: parentAccount.publicKey,
        newAccountPubkey: dataAccount.publicKey,
        lamports: 100000000,
        space: 4,
        programId: new PublicKey(PROGRAM_ID),
    });
    const transaction = new Transaction().add(createAccountInstruction);
    await sendAndConfirmTransaction(connection, transaction, [parentAccount, dataAccount]);
    return dataAccount;
}

const numberToBuffer = (num: number) => {
    const buffer = Buffer.alloc(4);
    buffer.writeUInt32LE(num, 0);
    return buffer;
}

export const callInst = async (parentAccount: Keypair) => {
    const args = process.argv.slice(2);
    const operation = parseInt(args[0]);
    const number1 = parseInt(args[1]);
    const number2 = parseInt(args[2]);

    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const dataAccount = await createDataAccount(connection, parentAccount);

    const buffers = [
        Buffer.from(Uint8Array.from([operation])),  // 0 for Addition, 1 for Subtraction
        numberToBuffer(number1),
        numberToBuffer(number2)
    ];
    const data = Buffer.concat(buffers);
    const instruction = new TransactionInstruction({
        keys: [{ pubkey: dataAccount.publicKey, isSigner: false, isWritable: true }],
        programId: new PublicKey(PROGRAM_ID),
        data: data,
    });

    const transactionSignature = await sendAndConfirmTransaction(
        connection,
        new Transaction().add(instruction),
        [parentAccount]
    );

    console.log('Transaction signature:', transactionSignature);

    // Optionally, print the data account public key if needed
    console.log('Data account public key:', dataAccount.publicKey.toBase58());
}

callInst(acc);