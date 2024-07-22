
use borsh::{BorshDeserialize,BorshSerialize};
use solana_program::{
    account_info::{next_account_info,AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

#[derive(BorshSerialize,BorshDeserialize,Debug)]
pub struct CalculatorAccount{
    pub result:u32,
}
#[derive(BorshSerialize,BorshDeserialize,Debug)]
pub enum CalculatorInstruction{
    Addition{num1:u32,num2:u32},
    Subtraction{num1:u32,num2:u32},
}

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts:&[AccountInfo],
    instruction_data:&[u8],
)->ProgramResult{
    msg!("Calculator program -Entering process_instruction");

    let instruction =CalculatorInstruction::try_from_slice(instruction_data)
        .map_err(|_| {
            msg!("Failed to deserialize instruction data");
            ProgramError::InvalidInstructionData
        })?;
        let account_iter=&mut accounts.iter();

        let account = next_account_info(account_iter)?;

        if account.owner != program_id{
            msg!("Account does not have the correct program id");
            return Err(ProgramError::IncorrectProgramId);
        }
        let mut calculator_account=CalculatorAccount::try_from_slice(&account.data.borrow())?;
        msg!("current calculator account state: {:?}",calculator_account);

        match instruction{
            CalculatorInstruction::Addition { num1, num2 }=>{
                msg!("performing addition : {} + {} ",num1,num2);
                calculator_account.result= performAddition(num1,num2);
            }
            CalculatorInstruction::Subtraction { num1, num2 }=>{
                msg!("performing substation: {} - {}",num1,num2);
                calculator_account.result=performSubtraction(num1,num2);
            }
        }
        calculator_account.serialize(&mut &mut account.data.borrow_mut()[..])?;
        msg!("upload calculator account state: {:?}",calculator_account);
        Ok(())
}
pub fn performAddition(a:u32,b:u32)-> u32{
    a+b
}
pub fn performSubtraction(a:u32,b:u32)-> u32{
    a-b
}