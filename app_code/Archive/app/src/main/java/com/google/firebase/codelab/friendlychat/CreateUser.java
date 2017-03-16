package com.google.firebase.codelab.friendlychat;

import java.io.StringBufferInputStream;

public class CreateUser {
    private String Uid;
    private String Name;
    private String timeStamp;

    public  CreateUser() {

    }
    public CreateUser(String Uid, String Name) {
        this.Name = Name;
        this.Uid = Uid;
    }
    public CreateUser(String Uid, String Name, String TimeStamp) {
        this.Name = Name;
        this.Uid = Uid;
        this.timeStamp = TimeStamp;
    }

    public String getUid() {
        return this.Uid;
    }

    public String getName() {
        return Name;
    }

    public void setName(String Name) {
        this.Name = Name;
    }

    public void setUid(String Uid) {
        this.Uid = Uid;
    }
}

