// number
let balance = 12899.5

// deposit
function deposit(cash){
    balance+=cash
    // console.log(cash+" deposited to the bank")
    return cash+" has deposited"
}
// withdrawl
const withdrawl=(required)=>{
    if(balance>=required){
        balance-=required
        console.log(required+" has been withdrawn")
    }
    else{
        console.log("insufficient balance")
    }
}


// deposit(2900)
// const message = deposit(2900)
// console.log(message)
// console.log(balance)

withdrawl(2000)


