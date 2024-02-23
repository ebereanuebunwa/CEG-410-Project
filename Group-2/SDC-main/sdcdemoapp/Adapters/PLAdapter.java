package com.example.sdcdemoapp.Adapters;

import android.annotation.SuppressLint;
import android.content.Context;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.sdcdemoapp.Models.PLValue;
import com.example.sdcdemoapp.R;

import java.util.ArrayList;

public class PLAdapter extends RecyclerView.Adapter<PLAdapter.MyviewHolder> {
    Context context;
    ArrayList<PLValue> values;

    public PLAdapter(Context context, ArrayList<PLValue> values){
        this.context = context;
        this.values = values;
    }

    @NonNull
    @Override
    public PLAdapter.MyviewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.magnitude_layout, parent, false);
        return new PLAdapter.MyviewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull PLAdapter.MyviewHolder holder, @SuppressLint("RecyclerView") int position) {
        holder.value.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {

            }

            @Override
            public void afterTextChanged(Editable s) {
                try {
                    float value = Float.parseFloat(s.toString());
                    values.get(position).setValue(value);
                } catch (NumberFormatException e){
                    e.printStackTrace();
                }
            }
        });

        holder.distance.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {

            }

            @Override
            public void afterTextChanged(Editable s) {
                try {
                    float distance = Float.parseFloat(s.toString());
                    values.get(position).setDistance(distance);
                } catch (NumberFormatException e){
                    e.printStackTrace();
                }
            }
        });
    }

    @Override
    public int getItemCount() {
        return values.size();
    }

    public class MyviewHolder extends RecyclerView.ViewHolder {
        EditText value, distance;
        public MyviewHolder(@NonNull View itemView) {
            super(itemView);
            value = itemView.findViewById(R.id.value);
            distance = itemView.findViewById(R.id.distance);
        }
    }
}
