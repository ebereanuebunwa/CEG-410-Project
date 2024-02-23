package com.example.sdcdemoapp.Models;

import android.os.Parcel;
import android.os.Parcelable;

import androidx.annotation.NonNull;

public class PLValue implements Parcelable {
    int ID = -1;
    float value = 0;
    float distance = 0;

    public float getValue() {
        return value;
    }

    public void setValue(float value) {
        this.value = value;
    }

    public float getDistance() {
        return distance;
    }

    public void setDistance(float distance) {
        this.distance = distance;
    }

    public int getID() {
        return ID;
    }

    public void setID(int ID) {
        this.ID = ID;
    }

    public PLValue(){

    }

    public PLValue(int id){
        this.ID = id;
    }

    protected PLValue(Parcel in) {
        ID = in.readInt();
        value = in.readFloat();
        distance = in.readFloat();
    }

    public static final Creator<PLValue> CREATOR = new Creator<PLValue>() {
        @Override
        public PLValue createFromParcel(Parcel in) {
            return new PLValue(in);
        }

        @Override
        public PLValue[] newArray(int size) {
            return new PLValue[size];
        }
    };

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(@NonNull Parcel dest, int flags) {
        dest.writeInt(ID);
        dest.writeFloat(value);
        dest.writeFloat(distance);
    }
}
