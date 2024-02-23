package com.example.sdcdemoapp.Adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.sdcdemoapp.Models.PLValue;
import com.example.sdcdemoapp.Models.UVLValue;
import com.example.sdcdemoapp.R;

import java.util.ArrayList;

public class UVLAdapter extends RecyclerView.Adapter<UVLAdapter.MyviewHolder> {
    Context context;
    ArrayList<UVLValue> values;

    public UVLAdapter(Context context, ArrayList<UVLValue> values){
        this.context = context;
        this.values = values;
    }

    @NonNull
    @Override
    public UVLAdapter.MyviewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.magnitude_layout, parent, false);
        return new UVLAdapter.MyviewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull UVLAdapter.MyviewHolder holder, int position) {

    }

    @Override
    public int getItemCount() {
        return values.size();
    }

    public class MyviewHolder extends RecyclerView.ViewHolder {
        public MyviewHolder(@NonNull View itemView) {
            super(itemView);
        }
    }
}
