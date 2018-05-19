pragma solidity ^0.4.18;

contract PropertyTransfer {

    address public DA; // DA shall be the owner, we shall be initializing this variable's value by the address of the user who's going to deploy it. e.g. let's say DA itself.

    uint256 public totalNoOfProperty; // total no of properties under a DA at any point of time. they should increase as per the allottment to their respective owner after verification
    // This is the constructor whose code is
    // run only when the contract is created.
    constructor() public {
        DA = msg.sender; // setting the owner of the contract as DA.
    }

    /// modifier to check the tx is coming from the DA(owner) or not.
    modifier onlyOwner(){
        require(msg.sender == DA);
        _;
    }

    /// This structure is kept like this for storing a lot more information than just the name
    struct Property{
        address owner;
        string name;//keeping the map of the property against each address. we shall provide name to the property
        string locationAddress;
        string district;
        uint price;
        bool isSold;// we're keeping the count as well for each address
    } // reason for creating this structure is simple, that the details about properties can be multiple. e.g. Their GeoLocation, Address, dimension, Height etc. Right now, I'm saying it as just a name

    mapping(address => mapping(uint256=>Property)) public  propertiesOwner; // we shall have the properties mapped against each address by its name and it's individual count.
    mapping(address => uint256)  individualCountOfPropertyPerOwner;// how many property does a particular person hold
    event PropertyAlloted(address indexed _verifiedOwner, uint256 indexed  _totalNoOfPropertyCurrently, string _nameOfProperty, string _msg);
    event PropertyTransferred(address indexed _from, address indexed _to, string _propertyName, string _msg);
    event StringsEqualed(string s1, string s2);
    /// this shall give us the exact property count which any address own at any point of time
    function getPropertyCountOfAnyAddress(address _ownerAddress) public constant returns (uint256){
        uint count=0;
        for(uint i =0; i<individualCountOfPropertyPerOwner[_ownerAddress];i++){
            if(propertiesOwner[_ownerAddress][i].isSold != true)
                count++;
        }
        return count;
    }

    function getTotalNoOfProperty() public view returns (uint256){
        return totalNoOfProperty;
    }

    function getProperty(address addr, uint index) public view returns (address, string, string, string, uint, bool){
    Property prop = propertiesOwner[addr][index];
     return (prop.owner, prop.name,
      prop.locationAddress,
      prop.district, prop.price,
      prop.isSold );

    }

    /// this function shall be called by DA only after verification
    function allotProperty(address _verifiedOwner, string _propertyName, string _location, string _district, uint _price ) public
     onlyOwner
    {

        individualCountOfPropertyPerOwner[_verifiedOwner]++;
        propertiesOwner[_verifiedOwner][individualCountOfPropertyPerOwner[_verifiedOwner]].owner = _verifiedOwner;
        propertiesOwner[_verifiedOwner][individualCountOfPropertyPerOwner[_verifiedOwner]].name = _propertyName;
        propertiesOwner[_verifiedOwner][individualCountOfPropertyPerOwner[_verifiedOwner]].locationAddress = _propertyName;
        propertiesOwner[_verifiedOwner][individualCountOfPropertyPerOwner[_verifiedOwner]].district = _propertyName;
        propertiesOwner[_verifiedOwner][individualCountOfPropertyPerOwner[_verifiedOwner]].price = _price;
        totalNoOfProperty++;
        emit PropertyAlloted(_verifiedOwner,individualCountOfPropertyPerOwner[_verifiedOwner], _propertyName, "property allotted successfully");
    }

    /// check whether the owner have the said property or not. if yes, return the index
    function isOwner(address _checkOwnerAddress, string _propertyName)public constant returns (uint){
        uint i ;
        bool flag ;
        for(i=1 ; i <= individualCountOfPropertyPerOwner[_checkOwnerAddress]; i++){
            flag = stringsEqual(propertiesOwner[_checkOwnerAddress][i].name,_propertyName);
            if(flag == true){
                  if(propertiesOwner[_checkOwnerAddress][i].isSold == true){
                      flag = false;
                  }
                break;
            }
        }
        if(flag == true){
            return i;
        }
        else {
            return 999999999;// We're expecting that no individual shall be owning this much properties
        }

    }

    /// functionality to check the equality of two strings in Solidity
    function stringsEqual (string a1, string a2)public constant returns (bool){
        return keccak256(a1) == keccak256(a2)? true:false;
    }

    /// transfer the property to the new owner
    /// todo : change from to msg.sender

    function transferProperty (address _to, string _propertyName)public
    returns (bool ,  uint )
    {
        uint256 checkOwner = isOwner(msg.sender, _propertyName);
        bool flag;

        if(checkOwner != 999999999 && propertiesOwner[msg.sender][checkOwner].isSold == false){
            /// step 1 . remove the property from the current owner and decrase the counter.
            /// step 2 . assign the property to the new owner and increase the counter
            individualCountOfPropertyPerOwner[_to]++;
            propertiesOwner[_to][individualCountOfPropertyPerOwner[_to]] = propertiesOwner[msg.sender][checkOwner];
            propertiesOwner[msg.sender][checkOwner].name = "Sold";// really nice finding. we can't put empty string
            propertiesOwner[msg.sender][checkOwner].isSold = true;
            flag = true;
            emit PropertyTransferred(msg.sender , _to, _propertyName, "Owner has been changed." );
        }
        else {
            flag = false;
            emit PropertyTransferred(msg.sender , _to, _propertyName, "Owner doesn't own the property." );
        }
        return (flag, checkOwner);
    }

}
