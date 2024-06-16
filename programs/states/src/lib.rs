use anchor_lang::prelude::*;
pub mod states;
pub mod constant;
use crate::{constant::*, states::*};

declare_id!("DtZDScQsE4nu4wxuLQLVPcGWozx8nq5m7Yv4TFr9zJ6W");


#[program]
pub mod booking {
    use super::*;
    
    pub fn initialize_user(ctx: Context<InitializeUser>)->Result<()>{
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.authority = ctx.accounts.authority.key();
        user_profile.last_accommodation = 0;
        user_profile.accommodation_count = 0;
        Ok(())
    }
    pub fn add_accommodation(ctx:Context<AddAccommodation>,location:String,country:String,price:String,img:String) -> Result<()>{
        let accommodation_account = &mut ctx.accounts.accommodation_account;
        let user_profile = &mut ctx.accounts.user_profile;
        accommodation_account.authority = ctx.accounts.authority.key();
        accommodation_account.idx = user_profile.last_accommodation;
        accommodation_account.location = location;
        accommodation_account.country=country;
        accommodation_account.price=price;
        accommodation_account.img=img;
        accommodation_account.isReserved=false;

        user_profile.last_accommodation = user_profile.last_accommodation.checked_add(1).unwrap();

        user_profile.accommodation_count = user_profile.accommodation_count.checked_add(1).unwrap();
        Ok(())
        
    }

    pub fn update_accommodation(ctx:Context<UpdateAccommodation>, _accommodation_idx:u8,location:String,country:String, price:String, img:String) -> Result<()>{
        let accommodation_account = &mut ctx.accounts.accommodation_account;
        accommodation_account.location = location;
        accommodation_account.country = country;
        accommodation_account.price = price;
        accommodation_account.img = img;

        Ok(())
    }
    pub fn remove_accommodation(ctx: Context<RemoveAccommodation>,_accommodation_idx:u8)->Result<()>{
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.accommodation_count= user_profile.accommodation_count.checked_sub(1).unwrap();
        Ok(())
    }

    pub fn book_accommodation(
        ctx:Context<BookAccommodation>,
        idx:u8,
        date:String,
        location:String,
        country:String,
        price:String,
        img:String,
    ) -> Result<()>{
        let booking_account=  &mut ctx.accounts.booking_account;
        booking_account.authority=ctx.accounts.authority.key();
        booking_account.idx = idx;
        booking_account.date = date;
        booking_account.location = location;
        booking_account.country = country;
        booking_account.price = price;
        booking_account.img = img;
        booking_account.isReserved =true;
        Ok(())
    }
    pub fn cancel_booking(ctx: Context<CancelBook>, _booking_idx:u8) -> Result<()>{
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeUser<'info> {
  #[account(mut)]
    pub authority:Signer<'info>,

    #[account(
        init,
        seeds = [USER_TAG,authority.key().as_ref()],
        bump,
        payer = authority,
        space = 32 + 1 + 1 + 8
    )]
    pub user_profile: Box<Account<'info, UserProfile>>,

    pub system_program: Program<'info, System>,
    
}

#[derive(Accounts)]
#[instruction()]
pub struct AddAccommodation<'info>{
    #[account(
        mut,
        seeds = [USER_TAG, authority.key().as_ref()],
        bump,
        has_one=authority,        
    )]
    pub user_profile: Box<Account<'info, UserProfile>>,

    #[account(
        init,
        seeds = [ACCOMMODATION_TAG, authority.key().as_ref(), &[user_profile.last_accommodation]],
        bump,
        payer = authority,
        space = 2865 + 8,
    )]
    pub accommodation_account: Box<Account<'info, AccommodationAccount>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(accommodation_idx:u8)]
pub struct UpdateAccommodation<'info>{
  
    #[account(
        mut,
        seeds= [ACCOMMODATION_TAG, authority.key().as_ref(),&[accommodation_idx].as_ref()],
        bump,
        has_one=authority,
    )]
    pub accommodation_account: Box<Account<'info, AccommodationAccount>>,

     #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(accommodation_idx:u8)]
pub struct RemoveAccommodation<'info>{
    #[account(
        mut,
        seeds =[USER_TAG, authority.key().as_ref()],
        bump,
        has_one = authority,   
    )]
     pub user_profile: Box<Account<'info, UserProfile>>,

      #[account(
        mut,
        close = authority,
        seeds = [ACCOMMODATION_TAG, authority.key().as_ref(),&[accommodation_idx].as_ref()],
        bump,
        has_one=authority,
    )]
     pub accommodation_account: Box<Account<'info,AccommodationAccount>>,

     #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction()]
pub struct BookAccommodation<'info>{
    #[account(
        mut,
        seeds = [USER_TAG, authority.key().as_ref()],
        bump,
        has_one = authority,
    )]
    pub user_profile: Box<Account<'info, UserProfile>>,

    #[account(
        init,
        seeds = [BOOK_TAG, authority.key().as_ref()],
        bump,
        payer = authority,
        space = 3125 + 8,
    )]
    pub booking_account: Box<Account<'info, BookingAccount>>,
    
     #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
    
}

#[derive(Accounts)]
#[instruction()]
pub struct CancelBook<'info>{
    #[account(
        mut,
        close = authority,
        seeds = [BOOK_TAG, authority.key().as_ref()],
        bump,
        has_one = authority,
    )]
    pub booking_account: Box<Account<'info, BookingAccount>>,
    
      #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}