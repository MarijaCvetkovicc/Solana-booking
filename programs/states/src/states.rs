use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct UserProfile{
    pub authority: Pubkey,
    pub last_accommodation:u8,
    pub accommodation_count:u8,
}


#[account]
#[derive(Default)]
pub struct AccommodationAccount{
    pub authority: Pubkey,
    pub idx: u8,
    pub location: String,
    pub country: String,
    pub price: String,
    pub img: String,
    pub isReserved: bool,
}
#[account]
#[derive(Default)]
pub struct BookingAccount{
    pub authority: Pubkey,
    pub date: String,
    pub idx: u8,
    pub location: String,
    pub country: String,
    pub price: String,
    pub img: String,
    pub isReserved: bool,
}