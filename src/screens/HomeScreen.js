import React, {Component} from 'react';
import {Text, StyleSheet, View, ScrollView, TextInput, Picker, TouchableOpacity, FlatList, TouchableHighlight, Alert} from 'react-native';
import {StackActions, NavigationActions} from 'react-navigation';

//import icons
import Feather from 'react-native-vector-icons/Feather';

//import components
import AppHeader from '../components/AppHeader';
import BookContainer from '../components/BookContainer';

//import login user id
import loginUserId from '../../LoginUserId';

//server path
let config=require('../../Config');

export default class HomeScreen extends Component<Props> {
  constructor(props) {
    super(props);
    this.state={
      loginUserId:loginUserId.getUserId(),
      books:[],
      tradeDetails:[],
      search: '',
      selectedGenre: 'All',
      selectedLanguage: 'All',

      display:[],
    }
    this._query = this._query.bind(this);
  }
  
  componentDidMount() {
    this._query();
    const { navigation } = this.props;
    this.focusListener = navigation.addListener('didFocus', () => {
      this._query()
    });
  }

  componentWillUnmount(){this.focusListener.remove()}

  async _query() {
    await fetch(config.settings.serverPath+'/api/book',{method: 'GET'})
    .then((response) => {
      if(!response.ok) {
        Alert.alert('Error', response.status.toString());  
        throw Error('Error ' + response.status);
      }
      return response.json()  
    })
    .then((books) => {
      this.setState({books});
    })
    .catch((error) => {
      console.log(error)
      this._query()
    });
    
    await fetch(config.settings.serverPath+'/api/tradeDetails',{method: 'GET'})
    .then((response) => {
      if(!response.ok) {
        Alert.alert('Error', response.status.toString());  
        throw Error('Error ' + response.status);
      }
      return response.json()  
    })
    .then((tradeDetails) => {  
      this.setState({tradeDetails});
    })
    .catch((error) => {
      console.log(error)
      this._query()
    });
    this.filter()
  }

  filter(){
    let filtered=[];
    for(let i=0;i<this.state.books.length;i++){
      if(this.state.books[i].userId!=this.state.loginUserId){
        var traded=false;
        for(let j=0;j<this.state.tradeDetails.length;j++){
          if(this.state.books[i].bookId==this.state.tradeDetails[j].bookId){
            traded=true;
            break;
          }
        }
        if(!traded){
          filtered.push(this.state.books[i]);
        }
      }
    }

    if(this.state.search != ''){
      let searchResults = [];
      for(let i = 0; i < filtered.length;  i++){
        if(filtered[i].bookName.toLowerCase().includes(this.state.search.toLowerCase().trim())){
          searchResults.push(filtered[i]);
        }
      }
      filtered = searchResults;
    }

    if(this.state.selectedGenre != 'All'){
      let filterResults = [];
      for(let i = 0; i < filtered.length;  i++){
        if(filtered[i].genre == this.state.selectedGenre){
          filterResults.push(filtered[i]);
        }
      }
      filtered = filterResults;
    }

    if(this.state.selectedLanguage != 'All'){
      let filterResults = [];
      for(let i = 0; i < filtered.length;  i++){
        if(filtered[i].language == this.state.selectedLanguage){
          filterResults.push(filtered[i]);
        }
      }
      filtered = filterResults;
    }
    
    this.setState({display:filtered})
  }

  render() {
    //disable the warning
    console.disableYellowBox = true;
    return (
      <View style={styles.container}>
        <AppHeader></AppHeader>
        <View style={styles.search}>
          <TextInput
            style={styles.input}
            placeholder="Search by book name"
            placeholderTextColor="#828282"
            onChangeText={(bookName) => this.setState({search: bookName}, () => this.filter())}
          />
          <TouchableOpacity style={styles.searchIcon}>
            <Feather name={'search'} size={30} color={'#FAFAFA'}></Feather>
          </TouchableOpacity>
        </View>
        <View style={styles.filterContainer}>
          <View style={styles.pickerContainer}>
              <Picker
                style={styles.filter}
                dropdownIconColor="#FAFAFA"
                selectedValue={this.selectedGenre}
                onValueChange={(itemValue, itemIndex) => this.setState({selectedGenre: itemValue}, () => this.filter())}
              >
                <Picker.Item label="All Genre" value="All" />
                <Picker.Item label="Fiction" value="Fiction" />
                <Picker.Item label="Non-Fiction" value="Non-Fiction" />
              </Picker>
            </View>
          <View style={styles.pickerContainer}>
            <Picker
              style={styles.filter}
              dropdownIconColor="#FAFAFA"
              selectedValue={this.selectedLanguage}
              onValueChange={(itemValue, itemIndex) => this.setState({selectedLanguage: itemValue}, () => this.filter())}
            >
              <Picker.Item label="All Languages" value="All" />
              <Picker.Item label="English" value="English" />
              <Picker.Item label="Chinese" value="Chinese" />
              <Picker.Item label="Malay" value="Malay" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>
        </View>
        <FlatList
            style={styles.list}
            data={this.state.display}
            extraData={this.state.display}
            keyExtractor={item=>item.bookId}
            renderItem={({item})=>{
              return(
                <BookContainer
                  bookId={item.bookId}
                  userId={item.userId}
                  bookName={item.bookName}
                  fromScreen={'Home'}
                  thisProps={this.props}
                  refresh={this._query}
                ></BookContainer>
              )
            }}
          ></FlatList>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#212121',
  },
  search:{
    width:'100%',
    flexDirection:'row',
    alignItems:'center',
    padding:10
  },
  input: {
    width:'90%',
    padding:5,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 10,
    color: '#FAFAFA',
    fontSize: 18,
    fontFamily: 'Raleway-Regular',
    backgroundColor: '#424242',
  },
  searchIcon:{
    width:'10%',
    alignItems:'flex-end'
  },
  filterContainer: {
    flexDirection: 'row',
    margin:10,
    marginTop:0,
    marginBottom:0,
    justifyContent:'space-between'
  },
  pickerContainer: {
    width: '45%',
    borderBottomColor: '#AC94F4',
    borderBottomWidth: 2,
  },
  filter: {
    color: '#FAFAFA',
  },
  list:{
    margin:10,
    marginTop:20,
    marginBottom:20,
    borderTopWidth:2,
    borderColor:'#424242'
  },
  subheader:{
    flexDirection:'row',
    backgroundColor:'#424242',
    borderBottomWidth:1,
    borderBottomColor:'#212121',
    padding:5,
    paddingLeft:30,
    paddingRight:30,
    justifyContent:'space-between',
    alignItems:'center',
  },
  bookContainer:{
    flexDirection:"row",
    marginBottom:0,
    padding:10
  },
  book:{
    width:'100%', 
    flexDirection:'row'
  },
  bookIcon:{
    width:'20%',
    padding:10,
    alignItems:'center',
    justifyContent:'center',
  },
  bookName:{
    width:'80%',
    fontSize:18,
    fontFamily:'Raleway-Regular',
    color:'#FAFAFA',
    padding:10,
    paddingLeft:20
  },
});
